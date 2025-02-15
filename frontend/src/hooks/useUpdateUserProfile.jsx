import { QueryClient, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const useUpdateUserProfile = ()=>{
    const queryClient = useQueryClient();
    const {mutate:updateProfile, isPending:isUpdatingProfile} = useMutation({
        mutationFn: async (formData) => {
           try {
            console.log("fuhsduhasliufdhds",formData);
               const res = await fetch(`/api/users/update`,{
                   method: "POST",
                   headers:{
                       "Content-Type":"application/json",
                   },
                   body: JSON.stringify({formData})
               })
               const data = await res.json();
               console.log("fuhsduhasliufdhds",data);
               if(!res.ok){
                   throw new Error(data.error || "Something went wrong");
               }
               return data;
           } catch (error) {
               throw new Error(error.message);
           }
        },
        onSuccess:()=>{
            
           toast.success("Profile updated successfully");
           console.log("hello1")
           Promise.all([
               queryClient.invalidateQueries({queryKey:["authUser"]}),
               queryClient.invalidateQueries({queryKey:["userProfile"]})
           ])
           console.log("hello2")
        },
        onError:(error)=>{
           toast.error(error.message);
        }
   })
   return { updateProfile, isUpdatingProfile };

}
export default useUpdateUserProfile