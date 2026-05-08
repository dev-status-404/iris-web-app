import ViewLayout from "@/features/campaigns/ui/id";

const ViewPage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;

  return <ViewLayout id={id} />;
};

export default ViewPage;
