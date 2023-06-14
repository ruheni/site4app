import { NextResponse } from "next/server"

import { createEndpoint } from "@/lib/api/create-endpoint"
import { verifyUser } from "@/lib/api/verify-user"
import { pickUser } from "@/lib/pick"

export const GET = createEndpoint(async () => {
  const user = await verifyUser()
  return NextResponse.json(pickUser(user))
})
