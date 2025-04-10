import { FileUploader } from "@/components/file-uploader";
import { DarkModeToggle } from "@/components/DarkModeToggle";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-24">
      <div className="w-full max-w-3xl space-y-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            File Uploader
          </h1>
          <p className="text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
            Upload your files with our simple drag and drop interface.
          </p>
        </div>
        <DarkModeToggle />
        <FileUploader />
      </div>
    </main>
  );
}
