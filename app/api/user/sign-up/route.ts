import { NextResponse } from "next/server"
import { User, prisma } from "@/db"
import { T } from "@elijahjcobb/typr"
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library"

import { APIError } from "@/lib/api-error"
import { createEndpoint } from "@/lib/api/create-endpoint"
import { createPassword } from "@/lib/api/password"
import { tokenSign } from "@/lib/api/token"
import { verifyBody } from "@/lib/api/verify-body"
import { assertNonEmpty } from "@/lib/assert-filled"
import { pick } from "@/lib/pick"

export const POST = createEndpoint(async (req) => {
  const {
    email,
    password: rawPassword,
    name,
  } = await verifyBody(
    req,
    T.object({
      email: T.string(),
      password: T.string(),
      name: T.string(),
    })
  )

  if (rawPassword.length < 8)
    throw new APIError({
      statusCode: 400,
      message: "Your password must be at least 8 characters long.",
      code: "invalid_body",
    })

  assertNonEmpty(name, "name")

  const password = await createPassword(rawPassword)

  let user: User

  try {
    user = await prisma.user.create({
      data: {
        email,
        password,
        name: name.trim(),
      },
    })
  } catch (e) {
    if (e instanceof PrismaClientKnownRequestError && e.code === "P2002") {
      throw new APIError({
        statusCode: 400,
        message: "A user with this email already exists.",
        code: "already_exists",
      })
    }
    throw e
  }

  const token = await tokenSign(user.id)

  const res = NextResponse.json(pick(user, "id", "email", "name"))
  res.cookies.set("authorization", token)
  return res
})