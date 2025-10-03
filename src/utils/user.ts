import { User } from "@/app-core/prisma/prismadb";
import { SafeUser } from "@/app-core/src/utils/stripSensitiveUserData";

export function nameWithPrefix(user: SafeUser) {
  return `${user.prefix ? `${user.prefix} ` : ""}${user.firstName} ${user.lastName}`;
}
