import "./popup.scss"
import $ from "jquery";
import "foundation-sites";
import {getCourses, Course} from "./courses"
import {Assignment, getAssignments} from "./assignments";
import {strftime} from "./strftime"
/// <reference types="../node_modules/@types/chrome" />

const root = $("#main");
const now = new Date();

(async () => {
    let courses: Course[];
    try {
        root.empty().html("Fetching course list")
        courses = (await getCourses()).filter(c => c.active);
    } catch (e) {
        if (e.message === "Not logged in") {
            root.empty().html("Cannot fetch data. Please log in to <a href='https://www.gradescope.com/login' target='_blank'>Gradescope</a> and try again");
            return
        } else {
            console.error(e)
            root.empty().html("Unexpected error while fetching courses: "+e)
            return
        }
    }
    console.log(courses)
    let i = 0;
    let assignments: Assignment[] = [];
    root.empty().html(`Fetching assignments 0/${courses.length}`)
    let promise = new Promise((resolve) => {
        for (let course of courses)
            getAssignments(course).then(a => {
                assignments.push(...a)
                i += 1;
                root.empty().html(`Fetching assignments ${i}/${courses.length}`)
                if (i == courses.length) resolve(void "⊂(´・ω・｀⊂)") // embrace the void
            })
    })
    await promise;
    localStorage.setItem("assignments", JSON.stringify(assignments));
    console.log(assignments)
    root.empty();
    let pending_assignments = assignments
        .filter(a => (a.deadline > now || a.lateDeadline > now) && !a.submitted)
        .filter(a => (a.deadline.getTime() - now.getTime() < 14*24*60*60*1000))
        .sort((a, b) => a.deadline < b.deadline ? -1 : a.deadline == b.deadline ? 0 : 1);
    let table = $("<table><tr style='border-bottom: 1.5px solid'><th>Name</th><th>Course</th><th>Deadline</th></tr></table>").appendTo(root);
    console.log(pending_assignments);
    for (let a of pending_assignments) {
        let link = $(`<th><a href="https://gradescope.com${a.action ? a.action : a.course.link + "#grade-click=" + a.name}" target="_blank">${a.name}</a></th>`)
        let course = $(`<td>${a.course.name}</td>`)
        let deadline = $("<td>" + strftime(a.deadline, "%a, %b %d") + "<br>" + strftime(a.deadline, "%I:%M %p") + "</td>");
        $("<tr>").append(link).append(course).append(deadline).appendTo(table);

    }
})()


// @ts-ignore
$(document).foundation();
