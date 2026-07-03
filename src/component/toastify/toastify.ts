import toast from "react-hot-toast";

export function Success(message: string) {
  toast.success(message, { position: "top-right" });
}

export function Error(message: string) {
  toast.error(message || "Something went wrong.", { position: "top-right" });
}

export function Warning(message: string) {
  toast(message || "Please review this action.", { position: "top-right" });
}
