import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import image from "../assets/1H9A1341 1.svg";

const AllHeader = ({title, link}: {title: string, link: string}) => {
  const { t } = useTranslation();
  
  return (
    <div>
        <div className="w-full lg:w-[1380px] mx-auto mt-6 sm:mt-8 md:mt-10 lg:mt-[80px] bg-[#fff] flex flex-col lg:flex-row items-center justify-between rounded-[12px] sm:rounded-[16px] lg:rounded-[20px] px-4 sm:px-6 md:px-8 lg:px-0">
            <div className="w-full lg:w-[55%] p-4 sm:p-5 md:p-6 lg:p-[30px] flex flex-col gap-3 sm:gap-4 md:gap-[15px] font-medium">
               <div className="text-[12px] sm:text-[14px] md:text-[16px] text-[#BBB] flex items-center gap-2 sm:gap-[10px]">
               <Link to="/" >{t("common.home")}</Link>/<Link to={link} >{title}</Link>
               </div>
                <h1 className="text-[28px] sm:text-[36px] md:text-[44px] lg:text-[54px] font-bold">{title}</h1>
            </div>
            <div className="w-full lg:w-[45%] px-4 sm:px-6 md:px-8 lg:px-0 pb-4 sm:pb-6 md:pb-8 lg:pb-0">
                <img src={image} alt={title} className="w-full h-auto max-h-[220px] sm:max-h-[280px] md:max-h-[340px] lg:max-h-full object-cover"/>
            </div>
        </div>
    </div>
  )
}

export default AllHeader;