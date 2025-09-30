export default async function HomePage() {
  return (
    <div className="flex-grow">
      {/* Hero */}
      <section className="relative h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBxrUDgNu6E0R-PPGz5C18jPSlyxZrz77rop4ZBBkyECbBFcwL7yDR9GTnddl8NfAjLASDfCBuNkcIdkzR8354KIGfSwLYpPfnNODONlaQkuPmoQuuwEW28l1ntEUZ4ngMz7R4ArnnpDIEiQmfVcpDSSuqP4p6SINkSFGaT771CVOw7QM7oVVBlvJcAiaqbEa40ktfP_wT5yjW-gvCIyFAlvR0ERPxprJNxBDkV8EmS3O9LB12amhWa7p7vi8ObXMrj9tvbgg-OLoM")',
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 p-4">
          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight tracking-tight mb-4">
            Find Your Perfect{' '}
            <span className="animated-text-container text-primary">
              <span className="animated-text block">
                <div>clothing.</div>
                <div>jewelry.</div>
                <div>footwear.</div>
                <div>clothing.</div>
              </span>
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/90 mb-8">
            Explore unique pieces from top vendors. The latest trends are just a click away.
          </p>
          <a
            href="/products" 
            className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-lg text-lg hover:bg-primary/90 transition-all transform hover:scale-105"
          >
            Shop Now
          </a>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-content-light dark:text-content-dark text-center mb-12">
            Shop by Category
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="group relative rounded-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAfy-25V-1xtFl85o6kGC2tKzDPhgVFDXSUaOfQvsbexxjtJfVYUnV4gpq8-vS5PKNfZ3B2IGVyd9cOb3dFP_c3TDTTNaaYUlUgUiAwyrCirtIPvi25-imwgi-Q5vIV_xY4Fdc1_2eVVObAqmW07akw19SNMVkIf-zBiPpi3it6f0QdhZlSh9ynsCJHZvWeDrhNqBqFueMgefgM1cyZIhCm8X4HSHRpPTi1LPhVoxewhNWvsaVwi1mUEUQ2bdrx1ReC_QBmeLdZ53Y")',
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
              <div className="relative p-6 h-80 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white">Clothing</h3>
                <p className="text-white/80 mt-2">Latest fashion trends</p>
              </div>
            </div>
            <div className="group relative rounded-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out lg:col-span-2">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD7db0ANALdiRNswsPbYBcOHj3Dwa-QSPWaRVnBebrxPlYexZXc4-eK_gWf-CxU3lG6fIzM1JUESsCfa8t6q2z41ARS2Ip9duMWrKDYMTIhiAeK79CzUr33FxjjXNL4eU1B39qtZTETayR3YYqxlbeaH__C9av2lqCaF7_Gi-Apgu-skmryGOPFjz6Dn9oBe49zQhBtnoPX-N7zeEJSzjXCLNTMzwyrYWsAQ-DGBkkRjYenI0nurSFzF7iO53PW2hbxUSVxxxlINdA")',
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
              <div className="relative p-6 h-80 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white">Jewelry</h3>
                <p className="text-white/80 mt-2">Unique and stylish pieces</p>
              </div>
            </div>
            <div className="group relative rounded-xl overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 ease-in-out">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-110"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAoY1DVy0tBw74TplNRpPTNIF0fs7yvtAD4v7VAId3f45DC3B2O1ffW28juTZPBSykh00m3ZEYfqzVph4a0elXfxdtN1MChpgEV-jB4FrrKQNMV-j7p5VZgAH07bTuoKWHglT4cfo33BpGY6ArFoCDuhjTrAz8jvg7EY85EBNONNCv9BYpi_IHOIGxo-zlOsYDs8nPdu7FbPJenjxa8yGAEyF2J94pXDuLdgG_KArVonfNSedqmUHNe88AeXo5V4YqqewDmH0hGq54")',
                }}
              />
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors" />
              <div className="relative p-6 h-80 flex flex-col justify-end">
                <h3 className="text-2xl font-bold text-white">Footwear</h3>
                <p className="text-white/80 mt-2">Comfortable and stylish</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials grid (bento) */}
      <section className="bg-background-light dark:bg-background-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-content-light dark:text-content-dark text-center mb-12">
            What Our Customers Say
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            <div className="bento-card col-span-2 row-span-2 rounded-xl p-6 md:p-8 flex flex-col justify-center items-center text-center glassmorphism">
              <img
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDo_m2gJk05d-JpDqP2g6w1mD3bW6_nJgYv4aCg0B8r5q_rI-eK0gZ1fX_c7c8w-qV0hJjK4a5b-hK0e_dG5y6m4sLp_p1l-c2o"
                alt="Customer Photo"
              />
              <p className="text-content-light/80 dark:text-content-dark/80 mb-4 text-lg">
                "I absolutely love the unique items I find on GoShada! The quality is always top-notch."
              </p>
              <p className="font-bold text-primary">- Sarah L.</p>
            </div>
            <div className="bento-card rounded-xl overflow-hidden aspect-square">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDUqNNPgEVKLQ-GpcH4pI1mrzt9vlsHP-6jxfVZodqyuhWsWkdAyDD8jpkgHx2KZSOoSI2n4ss2LecDp4n4Je6mm-ZAV4OvVKsvqMi-BI1kHoahfL5t1hknZG_ULG-3qQ0oOHv68E3Nofof8zXYrEPfx-TJlve1yoO3wyq2KxanfPU-RMhZ3IHDU25Cqk-8MgrEpyGpw5GfjjUUOfYn1qOdAVZhE5vwp6a5Ohhh1VdWhK9qcbLbnLiw1FjorxgDXdQ5ds9ZgXhnFEc" alt="Customer review photo" />
            </div>
            <div className="bento-card rounded-xl overflow-hidden aspect-square">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbHZMrDvVL3i2seCAZFPxPgc-JR9Od4HH840ONKaStlbxa9F44n-QMPCVdOOUnC-QTruNklHEL6by_cKaoPu9YwebgmEzE_TycMlSHloZU4x5VZ5ha_eUT16lmwHV_oMQ07zuCU2fZOG175Z82_g5zmXwgCNoJ9n9-qedk2sY87e01qH7k50AoFVBp-cieu5PhFMd_oI-0A8HblZz2P5aVsr00VVv3fgF_s4S4R7Lnj9qv-Fcb5C9N_wBS8brOKBJhKOB7Z7Uqmo4" alt="Customer review photo" />
            </div>
            <div className="bento-card rounded-xl overflow-hidden aspect-square">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCQKk1GBVroJ67L0R7uOhW0258zk7WaRBu0tkdoZ67z-is5S5U60zHT3s8B4X7zq0VpZTB5odb7mmDmwDGHLUq9O5IY1HWONL1jKI9RVVExpMPi1JnQQHdFdr8D0ZLKZ8xL_yDk9NDBbbLocX6JQ5IfO_Hx6nOyuFn6D_CJaJNPZu_9AV6mc1vfIZi6t0bIGs7Cn-Eg--qtEcDPJDiT6jT0U7W-l71bsAOfUFRoPLBtQ5Wwtt1xmJWcnWqCOxUWr7P7HFkNHK2Wuy8" alt="Customer review photo" />
            </div>
            <div className="bento-card rounded-xl overflow-hidden aspect-square">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBuEXbZwUo9vyYhmjOOfAdYEHoNgFBi0ud63tSoSG1qHYNv5SaAxnaGdjMbL0vLfC5UOVj4WCpd84ZmR9rHqNxURnQjC8oMURtOJmFvHY2WvpawuqaE7TMBB9stAmDI7vZhiLR4nxLb_yAcJ0ZJdCoq6MvbZT59dyOBBx0VKBIwPdyNrQu7EtBq30jDSucC5TxHxANVxh-XQ_LLgnUlU-ALev4ya0zOKLc1V4kE-NNtmbWlP7hZRZwV7vuVeENvsFQ6P_35Htv7H1s" alt="Customer review photo" />
            </div>
            <div className="bento-card col-span-2 row-span-2 rounded-xl p-6 md:p-8 flex flex-col justify-center items-center text-center glassmorphism">
              <img
                className="w-24 h-24 rounded-full mx-auto mb-4 object-cover border-4 border-primary/50"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8mX7rK9b9pW4xJ7jJ3n6lM7o7c8s7w5vU4dK9z3fX2g8dY1l7p0h_qH9mJ6lP5rK3jL8nB7mJ6lO4nE3dK2rJ8k9"
                alt="Customer Photo"
              />
              <p className="text-content-light/80 dark:text-content-dark/80 mb-4 text-lg">
                "Finally, a marketplace that feels curated and special. I've discovered so many amazing small businesses."
              </p>
              <p className="font-bold text-primary">- Michael B.</p>
            </div>
            <div className="bento-card rounded-xl overflow-hidden aspect-square">
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8FhIbuRZHKiiAGlVF6QF38MmTOK5CUf8-Wy8PYXmPSGXEcdTneL3dlUNjK7PqR0ne1k-alI_nhwG1xnepwM_bbtgT3-HFa35fMsK05PiiWXEmRmIyg7FsVKBWh0_FSQZlZ2UcAH3hNPnraocWjZ6VCe1CwLzAiuVKRutDIot4o0nwOTp2K5ka957ed3z_bFrOtdP9MLjjV3AErszIXnx2FnHJYdeUtTfnQwlu5YyNykIkDyWNU3GjkmH9l7THLy6QAiMDiRBo_dE" alt="Customer review photo" />
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-primary/5 dark:bg-primary/10 py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-content-light dark:text-content-dark">
              More Than Just a Marketplace
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-content-light/80 dark:text-content-dark/80">
              Discover the features that make GoShada the best place to shop and sell.
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-content-light dark:text-content-dark">Discover Unique Vendors</h3>
              <p className="mt-2 text-content-light/70 dark:text-content-dark/70">Explore a curated selection of talented artisans and creators.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-content-light dark:text-content-dark">Secure Transactions</h3>
              <p className="mt-2 text-content-light/70 dark:text-content-dark/70">Shop with confidence using our secure payment gateway.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary text-white mb-4">
                <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-content-light dark:text-content-dark">Powerful Vendor Tools</h3>
              <p className="mt-2 text-content-light/70 dark:text-content-dark/70">We empower our vendors with tools to grow their business.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background-light dark:bg-background-dark py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-xl p-8 md:p-12 text-white overflow-hidden bg-primary">
            <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full" />
            <div className="absolute -bottom-16 -left-10 w-64 h-64 bg-white/10 rounded-full" />
            <div className="relative z-10 grid md:grid-cols-2 gap-8 items-center">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-extrabold tracking-tight">Ready to Sell on GoShada?</h2>
                <p className="mt-4 max-w-xl text-lg text-primary/80">
                  Join our community of creators and entrepreneurs. It's easy to get started.
                </p>
                <a
                  href="#"
                  className="mt-8 inline-block bg-white text-primary font-bold py-3 px-8 rounded-lg text-lg hover:bg-white/90 transition-all transform hover:scale-105"
                >
                  Vendor Application
                </a>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bento-card animate-bento-pulse rounded-lg p-4 bg-white/20 backdrop-blur-md">
                  <svg className="w-10 h-10 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <p className="text-center font-semibold text-sm">Easy Store Setup</p>
                </div>
                <div className="bento-card animate-bento-pulse rounded-lg p-4 bg-white/20 backdrop-blur-md" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-10 h-10 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
                  </svg>
                  <p className="text-center font-semibold text-sm">Growth Analytics</p>
                </div>
                <div className="bento-card animate-bento-pulse rounded-lg p-4 bg-white/20 backdrop-blur-md" style={{ animationDelay: '1s' }}>
                  <svg className="w-10 h-10 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.122-1.28-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.653.122-1.28.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="text-center font-semibold text-sm">Community Support</p>
                </div>
                <div className="bento-card animate-bento-pulse rounded-lg p-4 bg-white/20 backdrop-blur-md" style={{ animationDelay: '1.5s' }}>
                  <svg className="w-10 h-10 text-white mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  <p className="text-center font-semibold text-sm">Secure Payments</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
