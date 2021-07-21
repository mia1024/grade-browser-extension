const expect = require("expect") // using require so my IDE is not mad at me
import {createContainer, createEvent, createSimpleEvent, getEvent} from "../src/core/events/events"
import {Event, EventType} from "../src/core/events/types"

describe("core/events.ts", () => {
    it("has the same class and instance listeners", () => {
        let E = createEvent<void>("base")
        let e = new E()
        expect(e.listeners).toBeDefined()
        expect(e.listeners).toBe(E.listeners)
        expect(e.listeners.constructor.name).toBe('Set')
    })

    it("produces correct classes from createSimpleEvent()", () => {
        let Event = createSimpleEvent("test.simple.create")
        expect(Event.type).toBe("test.simple.create")
        expect(new Event().type).toBe(Event.type)
        expect(Event.name).toBe("TestSimpleCreateEvent")
    })

    it("produces correct classes from createEvent()", () => {
        let Event = createEvent("test.event.create")
        expect(Event.name).toBe("TestEventCreateEvent")
        let e = new Event("test data")
        expect(e.type).toBe("test.event.create")
        expect(e.data).toBe("test data")

        let EE = getEvent("test.event")
        expect(EE).toBeDefined()
        expect(EE!.name).toBe("TestEventEvent")
        expect(EE!.type).toBe("test.event")

        let ET = getEvent("test")
        expect(ET).toBeDefined()
        expect(ET!.name).toBe("TestEvent")
        expect(ET!.type).toBe("test")

    })

    it("handles event namespaces correctly", () => {
        let e: EventType<any>
        let name: string;

        for (let name of ["testNS",
                          "testNS.event",
                          "testNS.event.test",
                          "testNS.event2.test",
                          "testNS2.event.test",
                          "testNS2.event",
                          "testNS2"
        ]) {
            e = createEvent(name)
            expect(getEvent(name)).toBe(e)
        }
    })

    it("registers simple listeners correctly", () => {
        let E = createSimpleEvent("test.simple.listener")
        let e = new E()

        function listener(event: Event<void>) {}

        expect(E.listeners).toBeDefined()
        expect(e.listeners.size).toBe(0)
        expect(E.listeners.size).toBe(0)
        E.addListener(listener)

        expect(e.listeners.size).toBe(1)
        expect(E.listeners.size).toBe(1)

        E.addListener(() => {
        })
        expect(e.listeners.size).toBe(2)
        expect(E.listeners.size).toBe(2)
    })

    it("registers event listeners correctly", () => {
        let E = createEvent<string>("test.listener.data")

        function listener(event: Event<string>) {}

        expect(E.listeners).toBeDefined()
        expect(E.listeners.size).toBe(0)

        expect(E.addListener(listener)).toBe(E)
        expect(E.listeners.size).toBe(1)
        let e = new E("Data")
        expect(e.listeners.has(listener)).toBeTruthy()
        expect(() => E.addListener(listener)).toThrowError()

        expect(E.removeListener(listener)).toBe(E)
        expect(() => E.removeListener(listener)).toThrowError()
    })


    it("registers multiple listeners correctly", () => {
        // expect(BaseEvent.listeners).toBe(0)
        let E1 = createSimpleEvent("test.listener.multi.t1")
        let E2 = createSimpleEvent("test.listener.multi.t2")

        function f1() {}

        function f2() {}

        E1.addListener(f1)

        expect(E1.listeners.size).toBe(1)
        expect(E2.listeners.size).toBe(0)

        E2.addListener(f1)
        expect(E1.listeners.size).toBe(1)
        expect(E2.listeners.size).toBe(1)

        E2.addListener(f2)
        expect(E1.listeners.size).toBe(1)
        expect(E2.listeners.size).toBe(2)
    })

    it("creates containers correctly", () => {
        let c = createContainer(null)
        let E = c.createEvent("event")
        expect(E.container).toBe(c)
    })

    it("isolates containers correctly", () => {
        let c1 = createContainer(null)
        let c2 = createContainer(null)

        let E1 = c1.createEvent<void>("event")
        expect(c2.getEvent("event")).toBeUndefined()
        let E2 = c2.createEvent<void>("event")
        expect(E1).not.toEqual(E2)

        let count = 0

        function listener() {
            count += 1
        }

        E1.addListener(listener)

        let e1 = new E1()
        expect(count).toBe(0)
        e1.emit()
        expect(count).toBe(1)

        let e2 = new E2()
        e2.emit()
        expect(count).toBe(1)
    })


    it("validates event names correctly", () => {
        let {createEvent, getEvent} = createContainer(null)
        for (let name of [
            "",
            "13.24",
            "ab.3d",
            "-ab.cd",
            "_ab.cd",
            "ab._cd",
            "ab.",
            "ab._",
            "ab._ ",
            "ab._ _",
            "ab._._",
            "ab._._",
            "ab.._",
            "not.this.😃",
            "ab cd. ef gh"
        ]) {
            expect(() => createEvent(name)).toThrowError()
        }

        expect(createEvent("ab cd.ef gh")).toBeDefined()
        expect(createEvent("ab.cd.smile😃")).toBeDefined()

        expect(createEvent("ab.cd.ef")).toBeDefined()
        expect(getEvent("ab.cd")).toBeDefined()
        expect(() => createEvent('ab.cd', true)).toThrowError()
    })

    it("validates container names correctly", () => {
        expect(() => createContainer("")).toThrowError()

        let name = "TEST" + Math.random().toString().substring(2)
        expect(createContainer(name)).toBeDefined()
        expect(() => createContainer(name)).toThrowError()

        expect(() => createContainer("(╯°□°)╯︵ ┻━┻")).toThrowError()
        expect(createContainer("Phew ┬─┬ノ( º _ ºノ)")).toBeDefined()
        expect(createContainer("smile😃")).toBeDefined()

        expect(() => createContainer("O.O")).toThrowError()
    })

    it("emits events correctly", () => {
        let {createEvent} = createContainer(null)
        let E1 = createEvent<void>("event.emit.test1")
        let E2 = createEvent<number>("event.emit.test2")

        let count = 0

        E1.addListener(() => {
            count++
        })

        E2.addListener((e) => {
            count += e.data
        })

        let e1 = new E1()
        e1.emit()
        expect(count).toEqual(1)
        let e2 = new E2(5)
        expect(count).toEqual(1)
        e2.emit()
        expect(count).toEqual(6)

        E2.addListener((e) => {
            count -= e.data
        })
        e1.emit()
        expect(count).toEqual(7)
        e2.emit()
        expect(count).toEqual(7)
        E2.addListener((e) => {
            let e1 = new E1()
            e1.emit()
        })
        e2.emit()
        expect(count).toEqual(8)
    })

    it("emits recursive events correctly", () => {
        let {createEvent, getEvent} = createContainer(null)
        let EEmit = createEvent<void>("test.event.recursive.emit")
        let ERecursive = getEvent<void>("test.event.recursive")
        let EEvent = getEvent<void>("test.event")
        let ETest = getEvent<void>("test")

        expect(EEmit).toBeDefined()
        expect(ERecursive).toBeDefined()
        expect(EEvent).toBeDefined()
        expect(ETest).toBeDefined()

        ERecursive = ERecursive as EventType<void>
        EEvent = EEvent as EventType<void>
        ETest = ETest as EventType<void>
        let count = 0

        function listener() {
            count++
        }

        EEmit.addListener(listener)
        ERecursive.addListener(listener)
        EEvent.addListener(listener)
        ETest.addListener(listener)

        new EEmit().emit()
        expect(count).toEqual(4)

        new ERecursive().emit()
        expect(count).toEqual(7)

        new EEvent().emit()
        expect(count).toEqual(9)

        new ETest().emit()
        expect(count).toEqual(10)

    })

})
