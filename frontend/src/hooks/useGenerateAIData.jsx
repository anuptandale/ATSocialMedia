import { useMutation, useQueryClient } from '@tanstack/react-query'
import React from 'react'

const useGenerateAIData = () => {
  const queryClient = useQueryClient();
    const OPENAI_API_KEY="sk-ijklmnopqrstuvwxijklmnopqrstuvwxijklmnop";
  const {mutate:generateData, isPending:isGenerating} = useMutation({
    mutationFn:async(postData)=>{
        
        try {
            const res = await fetch("https://api.openai.com/v1/chat/completions",{
                method:"POST",
                headers:{
                    "Content-Type":"application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                },
                body: JSON.stringify({
                    model:"gpt-3.5-turbo",
                    messages:[{role:"user", content: `${postData} this is posts data so suggest me some short comment on this post` }]
                })
            })
            
            const data = await res.json();
            console.log('aiii',data)
            if(!res.ok){
                console.log(data.error)
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        } catch (error) {
            console.log("hello generate", error.message)
            throw new Error(error.message);
        }
    }
   
  });
  return {generateData, isGenerating};
}

export default useGenerateAIData
