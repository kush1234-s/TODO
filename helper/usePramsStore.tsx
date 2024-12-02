import { usePathname, useSearchParams,useRouter } from "next/navigation";
const useParamsStore = () => {
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();

  const addQueryParam = (key:string,val:string) => {
    if (searchParams) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key,val);
      router.push(path + "?" + params.toString());
    }
  };
  return addQueryParam; 
};

export default useParamsStore;
