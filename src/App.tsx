import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      {/* 可以在这里放置全局共享的 UI，例如导航栏、页脚等 */}
      <main>
        <Outlet /> {/* 子路由的页面内容将在这里渲染 */}
      </main>
    </>
  );
}

export default App;
