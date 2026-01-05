

import Blend from '/Images/blend.png'
import Hello from '/Images/wave.png'
import Curves from '/Images/curves.png'
import TopRight from '/Images/SignInRight.png'
import Star1 from '/Images/star1.png'
import Star2 from '/Images/star2.png'
import Star3 from '/Images/star3.png'

function LeftSide() {
    return (
        <div
            className="relative top-0 left-0 flex items-center justify-center hidden w-full bggradient h-screen text-white lg:h-full lg:block bg-button-gradient"
           
        >
            {/* Blended Foreground Image */}
            <div className="absolute inset-0 flex items-center justify-center opacity-50">
                <img src={Blend} className="object-cover w-full h-full" alt="Blended Foreground" />
            </div>

            {/* Curves */}
            <div className="absolute bottom-0">
                <img src={Curves} className="2xl:w-[800px] 2xl:h-[800px] xl:w-[600px] xl:h-[600px]" />
            </div>

            {/* Right Top Decor */}
            <div className="absolute top-28 right-[-80px]">
                <img src={TopRight} className="w-56 h-56" />
            </div>

            {/* Star 1 */}
            <div className="absolute 2xl:top-72 2xl:left-20 lg:left-10 lg:bottom-96">
                <img src={Star1} className="w-28 h-28" />
            </div>

            {/* Star 2 */}
            <div className="absolute 2xl:top-[350px] 2xl:right-[456px] lg:right-[200px] lg:bottom-[350px] xl:right-[250px]">
                <img src={Star2} className="w-20 h-20" />
            </div>

            {/* Star 3 */}
            <div className="absolute 2xl:bottom-[350px] 2xl:right-48 lg:right-20 lg:bottom-[250px] ">
                <img src={Star3} className="w-16 h-16" />
            </div>

            {/* Text Overlay */}
            <div className="relative z-10 px-6 text-left 2xl:top-[520px] lg:top-[520px] xl:top-[500px] left-16">
                <div className="flex gap-2 place-items-center">
                    <h1 className="font-semibold text-left 2xl:text-5xl lg:text-5xl xl:text-3xl font-poppins">Hello</h1>
                    <img src={Hello} className="w-6 h-6" />
                </div>
                <div className="py-4 text-left">
                    <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base ">Skip repetitive and manual sakes </p>
                    <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">marketing task, get highly productive</p>
                    <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">through automation and save tones of </p>
                    <p className="max-w-md 2xl:text-xl lg:text-xl xl:text-base">time</p>
                </div>
            </div>


            <p className="absolute bottom-10 left-1/2 transform -translate-x-1/2 text-[#FFFFFF] text-opacity-[41%]">
                All rights reserved
            </p>
        </div>
    );
}

export default LeftSide;
