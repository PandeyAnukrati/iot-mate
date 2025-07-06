import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "../firebase"

export default function LogoutButton() {
  return (
    <Button variant="outline" onClick={() => signOut(auth)}>
      Logout
    </Button>
  )
}
