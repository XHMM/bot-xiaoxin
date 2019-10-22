/*
decorator, 仅可用于class method的修饰
当被修饰函数抛异常时，该函数会打印错误，并返回一个默认值如果传入的话
* */
export function logError(returnValueWhenError?: any): any {
  const hasReturnValue = arguments.length === 1;

  return function(target, name, descriptor): void {
    const fn = descriptor.value;
    descriptor.value = async function(): Promise<any> {
      try {
        // eslint-disable-next-line prefer-rest-params
        return await fn.apply(this, arguments);
      } catch (e) {
        console.error("=== ERROR LOGGER ===");
        console.error(
          `Metadata: class name is ${
            target.constructor.name
          }, method name is ${name}`
        );
        console.error(e);
        if(hasReturnValue)
          return returnValueWhenError;
      }
    };
  };
}
