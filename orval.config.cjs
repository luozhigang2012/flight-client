// orval.config.js
module.exports = {
  "flight-api": {
    input: "../flight-api/target/openapi.json", // 指向后端生成的 openapi.json
    output: {
      // 切换到 tags-split 模式，这是大型项目的最佳实践
      // 它会根据 openapi.json 中的 'tags' 属性，为每个功能模块（如 'flight', 'booking'）创建独立的文件夹
      mode: "tags-split",
      // 指定所有生成的文件都应位于 'src/api' 目录下。
      // orval 会在此目录下创建基于 tag 的子文件夹
      target: "./src/api/",
      client: "react-query", // 我们要生成 React Query hooks
      // 启用 mock 数据生成，方便前端进行UI开发和测试
      mock: true,
      override: {
        // 使用我们自定义的 axios 实例
        mutator: {
          path: "./src/api/axiosInstance.ts",
          name: "axiosInstance",
        },
        operations: {
          // 移除重复的 'get' 前缀
          // 例如: getGetFlightDetail 会变为 getFlightDetail
          ".*": {
            operationName: (operation) => {
              if (operation.operationId.startsWith("getGet")) {
                return operation.operationId.substring(3); // 移除前三个字符 'get'
              }
              return operation.operationId;
            },
            query: {
              queryKey: (operation) => {
                // 确保生成的 queryKey 不包含重复的 'get'
                let operationName = operation.operationId;
                if (operationName.startsWith("getGet")) {
                  operationName = operationName.substring(3); // 移除前三个字符 'get'
                }
                return `get${
                  operationName.charAt(0).toUpperCase() + operationName.slice(1)
                }QueryKey`;
              },
              queryOptions: (operation) => {
                // 确保生成的 queryOptions 不包含重复的 'get'
                let operationName = operation.operationId;
                if (operationName.startsWith("getGet")) {
                  operationName = operationName.substring(3); // 移除前三个字符 'get'
                }
                return `get${
                  operationName.charAt(0).toUpperCase() + operationName.slice(1)
                }QueryOptions`;
              },
            },
          },
        },
      },
    },
  },
};
