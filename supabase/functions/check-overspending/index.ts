import { createClient } from "jsr:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const resendApiKey = Deno.env.get("RESEND_API_KEY")!;
const fromEmail = Deno.env.get("ALERT_FROM_EMAIL") ?? "onboarding@resend.dev";

type FinancialSettingsRow = {
  user_id: string;
  spending_currency: string;
  cached_exchange_rate: number;
  manual_exchange_rate: number | null;
  manual_exchange_rate_enabled: boolean;
};

function formatMonthBounds(now: Date) {
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const next = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const nextMonthStart = `${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}-01`;
  return { monthStart, nextMonthStart };
}

async function sendOverspendEmail(email: string, over: number, currency: string) {
  const amount = new Intl.NumberFormat("en-US", { style: "currency", currency }).format(over);
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${resendApiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: fromEmail,
      to: email,
      subject: "You're over budget this month",
      html: `<p>You've spent <strong>${amount}</strong> more than planned this month. Open the app to review your transactions.</p>`,
    }),
  });
}

Deno.serve(async (_req) => {
  const supabase = createClient(supabaseUrl, serviceRoleKey);
  const { monthStart, nextMonthStart } = formatMonthBounds(new Date());

  const { data: settingsRows, error: settingsError } = await supabase
    .from("financial_settings")
    .select("user_id, spending_currency, cached_exchange_rate, manual_exchange_rate, manual_exchange_rate_enabled");
  if (settingsError) {
    return new Response(JSON.stringify({ error: settingsError.message }), { status: 500 });
  }

  let checked = 0;
  let alerted = 0;

  for (const settings of (settingsRows ?? []) as FinancialSettingsRow[]) {
    checked += 1;

    const [incomeResult, transactionsResult, userResult] = await Promise.all([
      supabase.from("income_sources").select("amount").eq("user_id", settings.user_id),
      supabase.from("transactions").select("converted_amount").eq("user_id", settings.user_id).eq("type", "expense").gte("date", monthStart).lt("date", nextMonthStart),
      supabase.auth.admin.getUserById(settings.user_id),
    ]);

    const monthlyIncome = (incomeResult.data ?? []).reduce((sum, row) => sum + Number(row.amount), 0);
    const activeRate = settings.manual_exchange_rate_enabled && settings.manual_exchange_rate ? Number(settings.manual_exchange_rate) : Number(settings.cached_exchange_rate);
    const plannedSpend = monthlyIncome * activeRate;
    const actualSpend = (transactionsResult.data ?? []).reduce((sum, row) => sum + Number(row.converted_amount), 0);
    const over = Math.max(0, actualSpend - plannedSpend);
    const email = userResult.data?.user?.email;

    if (over > 0 && email) {
      await sendOverspendEmail(email, over, settings.spending_currency);
      alerted += 1;
    }
  }

  return new Response(JSON.stringify({ checked, alerted }), { headers: { "Content-Type": "application/json" } });
});
