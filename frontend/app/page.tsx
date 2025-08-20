export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold">E-Commerce Platform</h1>
      </div>

      <div className="relative flex place-items-center">
        <h2 className="text-2xl font-semibold">Welcome to our E-Commerce Platform</h2>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Products</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">
            Browse our wide selection of products
          </p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Cart</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Manage your shopping cart</p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Orders</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Track your order history</p>
        </div>

        <div className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100">
          <h3 className="mb-3 text-2xl font-semibold">Account</h3>
          <p className="m-0 max-w-[30ch] text-sm opacity-50">Manage your account settings</p>
        </div>
      </div>
    </main>
  );
}
