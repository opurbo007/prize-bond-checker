import CardDetails from "./CardDetails";

export default async function Page({ params }: { params: { cardId: string } }) {
  const { cardId } = params;

  // console.log("Card ID:", cardId);

  return <CardDetails cardId={cardId} />;
}
