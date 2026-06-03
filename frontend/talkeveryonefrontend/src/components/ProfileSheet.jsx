import dummyprofilepic from "../../public/Pictures/dummyprofilepic.png";
import { useLogout } from "@/hooks/useLogout";
import { Button } from "@/components/ui/button";

import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function ProfileSheet({ user }) {

    const { mutate: logout, isPending } = useLogout();
    return (
        <Sheet>

            <SheetTrigger asChild>

                <button
                    className="
                        w-full
                        flex
                        items-center
                        gap-3
                        p-3
                        rounded-2xl
                        hover:bg-violet-50
                        transition
                    "
                >
                    <img
                        src={dummyprofilepic}
                        alt="profile"
                        className="
                            h-12
                            w-12
                            rounded-full
                            object-cover
                            border-2
                            border-violet-200
                        "
                    />

                    <div className="flex-1 text-left">
                        <h3 className="font-semibold text-slate-800">
                            {user?.name}
                        </h3>

                        <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                        </p>
                    </div>

                </button>

            </SheetTrigger>

            <SheetContent>

                <SheetHeader>

                    <SheetTitle>
                        Profile
                    </SheetTitle>

                    <SheetDescription>
                        Manage your account
                    </SheetDescription>

                </SheetHeader>

                <div className="mt-8 flex flex-col items-center">

                    <img
                        src={dummyprofilepic}
                        alt="profile"
                        className="
                            h-24
                            w-24
                            rounded-full
                            border-4
                            border-violet-200
                        "
                    />

                    <h2 className="mt-4 text-lg font-semibold">
                        {user?.name}
                    </h2>

                    <p className="text-sm text-slate-500">
                        {user?.email}
                    </p>

                </div>

                <div className="mt-10 space-y-3">

                    <Button
                        variant="outline"
                        className="w-full justify-start"
                    >
                        My Profile
                    </Button>

                    <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => logout()}
                        disabled={isPending}
                    >
                        {isPending ? "Logging out..." : "Logout"}
                    </Button>

                </div>

            </SheetContent>

        </Sheet>
    );
}