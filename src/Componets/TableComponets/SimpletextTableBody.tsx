interface LiveTitleProps {
  title: string;
}

const SimpletextTableBody: React.FC<LiveTitleProps> = ({ title }) => {
  return (
    
      <div className="w-full  items-center text-sm font-poppins  text-textcolor">
        {title}
   
    </div>
  );
};

export default SimpletextTableBody;
