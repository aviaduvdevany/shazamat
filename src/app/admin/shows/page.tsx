import { getAllShows, getFeaturedShow } from "@/lib/shows/queries";
import FeaturedCard from "./FeaturedCard";
import ShowsTable from "./ShowsTable";
import NewShowDialog from "./NewShowDialog";

export const dynamic = "force-dynamic";

export default async function AdminShowsPage() {
  const [shows, featured] = await Promise.all([getAllShows(), getFeaturedShow()]);

  return (
    <div className="space-y-8" dir="rtl">
      {/* Page header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight">הופעות</h1>
          <p className="text-sm text-zinc-500 mt-1">ניהול כל הופעות שאזאמאט</p>
        </div>
        <NewShowDialog />
      </div>

      {/* Featured show */}
      <FeaturedCard featured={featured} />

      {/* Shows table */}
      <ShowsTable shows={shows} />
    </div>
  );
}
