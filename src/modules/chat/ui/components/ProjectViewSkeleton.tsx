"use client";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const ProjectsViewSkeleton = () => {
    // Simulate 3–4 skeleton cards
    const placeholders = Array.from({ length: 3});

    return (
        <div className="mx-8 md:mx-12 lg:mx-24 rounded-2xl bg-secondary flex flex-col gap-4 min-h-[30vh] p-8">
            <h4 className="font-semibold text-2xl">Recent Projects</h4>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
                {placeholders.map((_, i) => (
                    <Card key={i} className="relative">
                        <CardHeader>
                            <CardTitle>
                                <Skeleton className="my-2 size-8" />
                                <Skeleton className="h-5 w-[60%]" />
                            </CardTitle>
                            <CardDescription>
                                <Skeleton className="h-4 w-[40%]" />
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default ProjectsViewSkeleton;
