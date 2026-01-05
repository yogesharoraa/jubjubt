
import { useSelector } from 'react-redux'
import SearchBar from '../../Componets/SearchBar/SearchBar';
import TotalUsers from './TotalUsers';
import TotalPosts from './TotalPosts';
import UserGetByYear from './UserGetByYear';
import LoginType from './LoginType';
import DashboardUserList from './DashboardUserList';
import UsersByCountry from './UsersByCountry';
import PlatformActivity from './PlatformActivity';
import PostListDashborad from './PostListDashborad';
import TotalLive from './TotalLive';
import TotalEarning from './TotalEarning';
import HashtagList from './HashtagList';
import Apimethod from '../../Hooks/Apimethod';
import { useEffect } from 'react';


function Dashboard() {
    const isSidebarOpen = useSelector((state: { sidebar: { isOpen: boolean } }) => state.sidebar.isOpen);
    const { makeRequest } = Apimethod()


    useEffect(() => {
        const fetchConfig = async () => {
            const res = await makeRequest("/project_conf", null, undefined, "GET");
            if (res) {
                sessionStorage.setItem("mediaflow", res.data?.mediaflow);
            }
        };
        fetchConfig();
    }, []);

    return (
        <>
            <div className={` bg-primary ${isSidebarOpen ? "xl:pl-20" : "xl:pl-72"}`}>
                <SearchBar />
                <div className='grid flex-col gap-4 px-4 py-8 xl:grid-cols-4 md:grid-cols-2 xl:px-6 xl:gap-8'>
                    <TotalUsers />
                    <TotalPosts />
                    <TotalLive />
                    <TotalEarning />
                </div>
                <div className='flex flex-col w-full gap-4 px-6 2xl:flex-row'>
                    <UserGetByYear />
                </div>

                <div className='flex flex-col w-full py-8 gap-4 px-6 2xl:flex-row'>
                    <LoginType />
                    <DashboardUserList />
                </div>

                <div className='flex flex-col w-full gap-4 pb-6 px-6 2xl:flex-row'>
                    <UsersByCountry />
                    <PlatformActivity />
                </div>


                <div className='flex flex-col w-full gap-4 px-6 py-8 2xl:flex-row'>
                    <PostListDashborad />
                    <HashtagList />
                </div>
            </div>
        </>
    )
}

export default Dashboard



