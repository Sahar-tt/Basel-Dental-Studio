
// MOBILE NAVIGATION

const menuToggle = document.getElementById("menu-toggle");
const mainNav = document.getElementById("main-nav");

menuToggle.addEventListener("click", () => {
    const isOpen = mainNav.classList.toggle("open");
    menuToggle.setAttribute("aria-expanded", isOpen);
});

mainNav.querySelectorAll("a").forEach(link => {
    link.addEventListener("click", () => {
        mainNav.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
    });
});


// APPOINTMENT CALENDAR

const calendarDays = document.getElementById("calendar-days");
const calendarMonth = document.getElementById("calendar-month");
const previousMonth = document.getElementById("previous-month");
const nextMonth = document.getElementById("next-month");

const selectedDateLabel = document.getElementById("selected-date-label");
const timeSlots = document.getElementById("time-slots");
const bookingSubmit = document.getElementById("booking-submit");

const adminDate = document.getElementById("admin-date");
const adminTimes = document.getElementById("admin-times");
const saveAvailability = document.getElementById("save-availability");

let currentMonth = new Date();
currentMonth.setDate(1);

let selectedDate = null;
let selectedTime = null;

// Demo availability. Weekdays have sample appointment times.
const defaultTimes = [
    "09:00",
    "10:00",
    "11:30",
    "14:00",
    "15:30"
];

let availability = {};

try {
    availability = JSON.parse(
        localStorage.getItem("dentalAvailability") || "{}"
    );
} catch (error) {
    availability = {};
}

function dateKey(year, month, day) {
    return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getTimes(key, weekday) {
    if (Object.prototype.hasOwnProperty.call(availability, key)) {
        return availability[key];
    }

    // Monday to Friday only in the initial demonstration.
    if (weekday === 0 || weekday === 6) {
        return [];
    }

    return defaultTimes;
}

function renderCalendar() {
    calendarDays.innerHTML = "";

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    calendarMonth.textContent = currentMonth.toLocaleDateString(
        "en-GB",
        { month: "long", year: "numeric" }
    );

    const firstDay = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Monday-first calendar.
    const offset = (firstDay.getDay() + 6) % 7;

    for (let i = 0; i < offset; i++) {
        const empty = document.createElement("div");
        empty.className = "calendar-day empty";
        calendarDays.appendChild(empty);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const key = dateKey(year, month, day);
        const times = getTimes(key, date.getDay());

        const button = document.createElement("button");
        button.type = "button";
        button.textContent = day;
        button.className = "calendar-day";

        if (times.length > 0 && date >= today) {
            button.classList.add("available");
        } else {
            button.disabled = true;
        }

        if (selectedDate === key) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            selectedDate = key;
            selectedTime = null;
            renderCalendar();
            renderTimes();
        });

        calendarDays.appendChild(button);
    }
}

function renderTimes() {
    timeSlots.innerHTML = "";
    bookingSubmit.disabled = true;

    if (!selectedDate) {
        selectedDateLabel.textContent =
            "Select a date to see available times.";
        return;
    }

    const parts = selectedDate.split("-").map(Number);
    const date = new Date(parts[0], parts[1] - 1, parts[2]);

    selectedDateLabel.textContent = date.toLocaleDateString(
        "en-GB",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    const times = getTimes(
        selectedDate,
        date.getDay()
    );

    if (times.length === 0) {
        timeSlots.textContent = "No appointments available.";
        return;
    }

    times.forEach(time => {
        const button = document.createElement("button");
        button.type = "button";
        button.textContent = time;
        button.className = "time-slot";

        if (selectedTime === time) {
            button.classList.add("selected");
        }

        button.addEventListener("click", () => {
            selectedTime = time;
            renderTimes();
        });

        timeSlots.appendChild(button);
    });

    bookingSubmit.disabled = !selectedTime;
}


// MONTH NAVIGATION

previousMonth.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() - 1);
    renderCalendar();
});

nextMonth.addEventListener("click", () => {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    renderCalendar();
});


// DEMONSTRATION BOOKING FORM

document.getElementById("booking-form").addEventListener("submit", event => {
    event.preventDefault();

    if (!selectedDate || !selectedTime) {
        alert("Please select a date and time.");
        return;
    }

    const name = document.getElementById("patient-name").value;

    alert(
        `Thank you, ${name}!\n\n` +
        `Your selected appointment is:\n` +
        `${selectedDate} at ${selectedTime}.\n\n` +
        `This is a demonstration only. No real booking has been made.`
    );
});


// ADMINISTRATOR: ADJUST AVAILABLE TIMES

saveAvailability.addEventListener("click", () => {
    const date = adminDate.value;

    if (!date) {
        alert("Please select a date.");
        return;
    }

    const times = adminTimes.value
        .split(",")
        .map(time => time.trim())
        .filter(time => /^([01]\d|2[0-3]):[0-5]\d$/.test(time));

    if (times.length === 0) {
        alert("Please enter at least one valid time, or use an empty list to close the date.");
        return;
    }

    availability[date] = [...new Set(times)].sort();

    localStorage.setItem(
        "dentalAvailability",
        JSON.stringify(availability)
    );

    if (selectedDate === date) {
        selectedTime = null;
    }

    renderCalendar();
    renderTimes();

    alert("Availability updated in this browser.");
});


// INITIAL DISPLAY

renderCalendar();
renderTimes();
