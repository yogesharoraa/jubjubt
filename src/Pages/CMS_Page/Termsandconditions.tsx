import React, { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../Hooks/Hooks';
import { setAppConfig } from '../../Appstore/Slice/appConfigSlice';
import Apimethod from '../../Hooks/Apimethod';
import { Link } from 'react-router-dom';
import SearchBar from '../../Componets/SearchBar/SearchBar';
import PrivacyPolicy from './PrivacyPage';
import TermsConditions from './TermsConditions';
import TermCondtionNew from './TermCondtionNew';

function Termsandconditions() {

  const isSidebarOpen = useSelector((state: any) => state.sidebar.isOpen);
  const { loading, error, data, makeRequest } = Apimethod();
  useEffect(() => {
    makeRequest("/project_conf", null, undefined, "GET");
  }, []);
  const dispatch = useAppDispatch()
  useEffect(() => {
    if (data?.data) {
      dispatch(setAppConfig(data?.data))
    }
  }, [data?.data])
  return (
    <div className=' w-full'>
      <TermCondtionNew />
    </div>


  )
}

export default Termsandconditions
