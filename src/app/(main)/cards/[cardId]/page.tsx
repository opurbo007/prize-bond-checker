import CardDetails from "./CardDetails";

export default function CardPage({ params }: { params: { cardId: string } }) {
  return <CardDetails cardId={params.cardId} />;
}
