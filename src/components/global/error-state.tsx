import React from 'react'
interface ErrorStateProps {
    title: string
    description: string
}

const ErrorState = ({ title, description }: ErrorStateProps) => {
    return (
        <div className=' w-full min-h-[90vh] flex items-center justify-center'>
            <div className='flex flex-col gap-4 items-center justify-center'>
                <h2 className='text-destructive text-3xl md:text-6xl font-bold'>Oops!</h2>
                <div className='flex flex-col gap-2 items-center'>
                    <h1 className='text-2xl md:text-4xl font-bold text-center'>{title}</h1>
                    <p className='text-md md:text-lg  opacity-75 text-center'>{description}</p>
                </div>
            </div>
        </div>
    )
}

export default ErrorState
