import { ShieldCheck, Briefcase } from "lucide-react";

export default function EmpoweringEthiopias() {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-white text-gray-900">
      <div className="container px-4 md:px-6">
        <div className="bg-white rounded-xl p-8 md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1fr_600px] items-center">
            {/* Text Content */}
            <div className="flex flex-col justify-center space-y-6">
              <div className="space-y-2">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.4]">
                  Empowering Ethiopia&apos;s <br /> Workforce
                </h1>
                <p className="max-w-[700px] text-sm md:text-base text-gray-700 leading-normal">
                  The Ethiopian Labor ID is your key to a secure and prosperous future in the national labor
                  market. As a vital government initiative, it uniquely identifies you within the workforce,
                  connecting you to opportunities, skill development, and essential public services.
                </p>
              </div>

              {/* Feature Boxes Section */}
              <section className="w-full bg-blue-600 py-12 rounded-lg">
                <div className="container mx-auto px-4 grid gap-6">
                  {/* Box 1 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center text-white">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Secure Your Professional Identity</h3>
                      <p className="text-sm text-white">
                        Establish a verified and official profile for all your labor market interactions.
                      </p>
                    </div>
                  </div>

                  {/* Box 2 */}
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 flex items-center justify-center text-white">
                      <Briefcase className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-white">Unlock Access to Opportunities</h3>
                      <p className="text-sm text-white">
                        Connect seamlessly with job listings, training programs, and career guidance tailored to your
                        verified Labor ID.
                      </p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Image Section */}
            <div className="relative w-full h-[450px] lg:h-[550px] flex items-center justify-center lg:order-last">
              <img
                src="/images/ai image.png"
                width={600}
                height={550}
                alt="Abstract digital illustration representing workforce empowerment"
                className="object-contain w-full h-full rounded-lg shadow-md"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
