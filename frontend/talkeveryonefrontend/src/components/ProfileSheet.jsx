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
                        p-2
                        rounded-2xl
                        hover:bg-violet-50
                        active:bg-violet-100
                        transition-colors
                        duration-150
                    "
                >
                    <img
                        src={dummyprofilepic}
                        alt="profile"
                        className="
                            h-10
                            w-10
                            rounded-full
                            object-cover
                            border-2
                            border-violet-200
                            shrink-0
                        "
                    />

                    <div className="flex-1 text-left min-w-0">
                        <h3 className="font-semibold text-slate-800 text-sm truncate">
                            {user?.name}
                        </h3>
                        <p className="text-xs text-slate-500 truncate">
                            {user?.email}
                        </p>
                    </div>

                </button>
            </SheetTrigger>

            <SheetContent
                side="bottom"
                className="
                    rounded-t-3xl
                    px-5
                    pb-8
                    pt-4
                    max-h-[85dvh]
                    overflow-y-auto
                "
            >
                {/* Drag Handle */}
                <div className="flex justify-center mb-4">
                    <div className="h-1 w-10 bg-slate-200 rounded-full" />
                </div>

                <SheetHeader className="text-left mb-6">
                    <SheetTitle className="text-lg font-bold text-slate-800">
                        Profile
                    </SheetTitle>
                    <SheetDescription className="text-xs text-slate-400">
                        Manage your account
                    </SheetDescription>
                </SheetHeader>

                {/* Profile Info */}
                <div className="flex items-center gap-4 p-4 bg-violet-50 rounded-2xl mb-6">
                    <img
                        src={dummyprofilepic}
                        alt="profile"
                        className="
                            h-16
                            w-16
                            rounded-full
                            object-cover
                            border-4
                            border-white
                            shadow-sm
                            shrink-0
                        "
                    />
                    <div className="min-w-0">
                        <h2 className="font-bold text-slate-800 truncate">
                            {user?.name}
                        </h2>
                        <p className="text-sm text-slate-500 truncate">
                            {user?.email}
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                    <Button
                        variant="outline"
                        className="
                            w-full
                            justify-start
                            h-12
                            rounded-xl
                            text-slate-700
                            border-slate-200
                        "
                    >
                        My Profile
                    </Button>

                    <Button
                        variant="destructive"
                        className="w-full h-12 rounded-xl"
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