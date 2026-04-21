import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  const property = await prisma.property.findUnique({
    where: { id: params.id },
  })

  if (!property) {
    return NextResponse.json(
      { error: "Property not found" },
      { status: 404 }
    )
  }

  return NextResponse.json(property)
}