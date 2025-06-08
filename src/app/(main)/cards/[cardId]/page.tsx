import CardDetails from "./CardDetails";

export default async function Page({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const { cardId } = await params;

  // console.log("Card ID:", cardId);

  return <CardDetails cardId={cardId} />;
}
