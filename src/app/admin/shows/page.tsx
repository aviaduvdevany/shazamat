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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">הופעות</h1>
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
