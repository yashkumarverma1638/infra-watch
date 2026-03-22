-- DropForeignKey
ALTER TABLE "UptimeLog" DROP CONSTRAINT "UptimeLog_urlId_fkey";

-- AddForeignKey
ALTER TABLE "UptimeLog" ADD CONSTRAINT "UptimeLog_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE CASCADE ON UPDATE CASCADE;
