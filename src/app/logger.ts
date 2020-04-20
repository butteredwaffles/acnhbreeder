
// this class here just in case i do anything else with logging
export function info(msg: string, color: string = "black") {
    console.info("%c " + msg, `color: ${color}; font-weight: bold`);
}