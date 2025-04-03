import React, { ReactNode } from 'react'

export function IconButton({
    // activate will tell that particualr icon is activate or not if yes then draw it
    icon , onclick , activated
}: {
    icon: ReactNode,
    onclick: () => void,
    activated: boolean
}){
    return (
        <div className={`rounded-full border p-2 bg-black pointer hover:bg-gray-300 ${activated? 'text-red-700' : 'text-black'}`} onClick={onclick}>
        {icon}
        </div>
    )
}