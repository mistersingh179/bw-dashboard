// the `defer()` helper will be used to define a background function
import { defer } from "@defer/client"

// a background function must be `async`
async function helloWorld(name: string) {
  console.log('in bg job: started helloWorld');
  return new Promise(
    (resolve) => {
      setTimeout(() => {
        console.log(`Hello ${name}!`)
        console.log("job finished")
        resolve('done')
      }, 1000)
    }
  )
}

// the function must be wrapped with `defer()` and exported as default
export default defer(helloWorld)

if(require.main ===  module){
  (async () => {
    const job = defer(helloWorld);
    console.log("hi");
    await job("me");
  })();
}
