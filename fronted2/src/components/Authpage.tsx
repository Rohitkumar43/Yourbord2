

// make a commeon component and used it in both signin and rhe signup page



import React from 'react'

export function Authpage({ isSignin }:
    {
        isSignin: boolean
    }
) {

    return (
        <div className='flex items-center justify-center h-screen w-screen'>
            <div className="p-2 m-4 bg-white shadow-lg rounded-lg w-96">
                <div className="text-2xl font-bold text-center p-3 ">
                    <input type="text" placeholder='email' ></input>
                </div>
                <div className="text-2xl font-bold text-center p-3 ">
                    <input type="password" placeholder='password'></input>
                </div>
                <div className="text-2xl font-bold text-center p-3 rounded-lg bg-blue-500 text-white m-3">
                    <button>{isSignin ? "signin" : "signup"}</button>
                </div>
            </div>
        </div>
    )
}
