export const PageContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="bg-wild-sand">
      <div className=" pt-[1.375rem] lg:pt-8 pb-40 mx-6 sm:mx-12 lg:mx-[7.5rem] 3xl:mx-[22.5rem]">
        {children}
      </div>
    </div>
  );
};
