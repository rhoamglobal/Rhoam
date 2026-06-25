export function getAuthErrorMessage(error: { message?: string }) {
    const msg = error?.message?.toLowerCase() || "";
  
    if (msg.includes("invalid login")) {
      return "Incorrect email or password";
    }
  
    if (msg.includes("user already registered")) {
      return "This email is already in use";
    }
  
    if (msg.includes("email not confirmed")) {
      return "Please verify your email before logging in";
    }
  
    if (msg.includes("network")) {
      return "Network error. Check your internet connection";
    }
  
    return "Something went wrong. Please try again";
  }