import LeftSide from './LeftSide'
import RightSide from './RightSide'

function Bothleftandright() {
    return (
        <div className="lg:flex   ">
            {/*  left side admin */}

            <div className='2xl:w-[50%] lg:w-[50%]'>
                <LeftSide />
            </div>


            {/* right side  */}

            <div className='2xl:w-[50%] lg:w-[50%] w-full  '>
                <RightSide />
            </div>

        </div>
    )
}

export default Bothleftandright
