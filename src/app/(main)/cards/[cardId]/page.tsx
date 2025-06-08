import dynamic from "next/dynamic";

const CardDetails = dynamic(() => import("./CardDetails"), { ssr: false });

interface PageProps {
  params: {
    cardId: string;
  };
}

export default function CardPage({ params }: PageProps) {
  return <CardDetails cardId={params.cardId} />;
}
