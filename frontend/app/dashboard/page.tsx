import { getUserData } from "@/lib/cookies";


export default async function DashboardPage() {
    const user = await getUserData();
    const name =
        user?.firstName || user?.username || user?.name || user?.email || "Driver";

    return (
        <section className="mx-auto w-full max-w-[1440px] px-6 py-16">
            <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
                <div>
                    <p className="mb-3 text-xs font-bold uppercase tracking-[1.5px] text-muted">
                        Dashboard
                    </p>
                    <h1 className="text-4xl font-bold uppercase leading-none text-on-dark md:text-5xl">
                        Welcome, {name}
                    </h1>
                </div>
            </div>
        </section>
    );
}