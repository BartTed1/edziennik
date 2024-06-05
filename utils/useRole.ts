import { useEffect, useState } from "react";
import {usePathname, useRouter} from "next/navigation";

function useRole(role: string): boolean {
	const [isRole, setIsRole] = useState(null);
	const router = useRouter();
	const pathname = usePathname();

	useEffect(() => {
		if (typeof window === 'undefined') return;
		const storedRole = localStorage.getItem('role');
		setIsRole(storedRole === role);

	}, [pathname, role, router]);

	return isRole;
}

export default useRole;

