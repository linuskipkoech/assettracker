import { AssetForm } from "@/components/asset-form";
import { PageHeader } from "@/components/ui/page-header";

export default function NewAssetPage() {
  return (
    <div className="mx-auto max-w-3xl w-full px-4 sm:px-6 py-8 space-y-6 animate-fade-in">
      <PageHeader title="Add an asset" description="Choose a type below, then fill in what you know." />
      <AssetForm />
    </div>
  );
}
