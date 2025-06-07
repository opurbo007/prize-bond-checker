import CardDetails from "./CardDetails";

interface PageProps {
  params: {
    cardId: string;
  };
}

export default function CardPage({ params }: PageProps) {
  const { cardId } = params;

  return <CardDetails cardId={cardId} />;
}
