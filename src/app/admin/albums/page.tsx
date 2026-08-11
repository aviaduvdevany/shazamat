import { getAllAlbums } from "@/lib/albums/queries";
import AlbumsTable from "./AlbumsTable";
import NewAlbumDialog from "./NewAlbumDialog";

export const dynamic = "force-dynamic";

export default async function AdminAlbumsPage() {
  const albums = await getAllAlbums();

  return (
    <div className="space-y-8" dir="rtl">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">אלבומים</h1>
          <p className="text-sm text-zinc-500 mt-1">ניהול כל אלבומי שאזאמאט</p>
        </div>
        <NewAlbumDialog />
      </div>

      {/* Albums table */}
      <AlbumsTable albums={albums} />
    </div>
  );
}
