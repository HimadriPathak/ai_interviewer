"use client";
import ResumeForm from "@/components/ResumeForm";

const Page = () => {
  return (
    <div>
      <section className="card-cta flex-col">
        {/* <div className="flex flex-col max-w-lg"> */}
        <h2>
          Start your AI interview — just upload your resume and job description.
        </h2>
        <ResumeForm />
        {/* </div> */}

        {/* <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        /> */}
      </section>
    </div>
  );
};

export default Page;
