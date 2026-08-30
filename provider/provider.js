import {
    watchAuth,
    getUserProfile,
    logoutUser
} from "../../js/auth.js";

import {
    watchProviderBookings,
    updateBookingStatus
} from "../../js/booking.js";


let providerBookings = [];


// ==========================================
// AUTH
// ==========================================

watchAuth(async user => {

    if (!user) {

        window.location.href =
            "../../pages/login.html";

        return;

    }


    const profile =
        await getUserProfile(user.uid);


    if (
        profile?.role !==
        "provider"
    ) {

        alert(
            "Provider access required."
        );

        window.location.href =
            "../../index.html";

        return;

    }


    document.getElementById(
        "providerName"
    ).textContent =
        profile.name || "Provider";


    watchProviderBookings(
        user.uid,
        renderRequests
    );

});


// ==========================================
// RENDER
// ==========================================

function renderRequests(bookings) {

    providerBookings = bookings;


    document.getElementById(
        "totalRequests"
    ).textContent =
        bookings.length;


    document.getElementById(
        "pendingRequests"
    ).textContent =
        bookings.filter(
            b => b.status === "Pending"
        ).length;


    document.getElementById(
        "completedRequests"
    ).textContent =
        bookings.filter(
            b => b.status === "Completed"
        ).length;


    const container =
        document.getElementById(
            "requestList"
        );


    if (!bookings.length) {

        container.innerHTML = `

            <div class="empty-state">

                <i class="bi bi-inbox fs-1"></i>

                <h4 class="mt-3">
                    No service requests
                </h4>

                <p>
                    New customer bookings
                    will appear here.
                </p>

            </div>

        `;

        return;

    }


    container.innerHTML =
        bookings
            .sort(
                (a, b) =>
                    (b.createdAt?.seconds || 0)
                    -
                    (a.createdAt?.seconds || 0)
            )
            .map(
                createRequestCard
            )
            .join("");

}


// ==========================================
// REQUEST CARD
// ==========================================

function createRequestCard(
    booking
) {

    let statusClass =
        "status-pending";


    if (booking.status === "Accepted") {
        statusClass =
            "status-accepted";
    }

    if (booking.status === "In Progress") {
        statusClass =
            "status-progress";
    }

    if (booking.status === "Completed") {
        statusClass =
            "status-completed";
    }

    if (booking.status === "Rejected") {
        statusClass =
            "status-rejected";
    }


    let actions = "";


    // Pending
    if (
        booking.status ===
        "Pending"
    ) {

        actions = `

            <button
                class="btn btn-success btn-sm"
                onclick="changeStatus(
                    '${booking.id}',
                    'Accepted'
                )">

                <i class="bi bi-check-lg"></i>
                Accept

            </button>


            <button
                class="btn btn-outline-danger btn-sm"
                onclick="changeStatus(
                    '${booking.id}',
                    'Rejected'
                )">

                <i class="bi bi-x-lg"></i>
                Reject

            </button>

        `;

    }


    // Accepted
    if (
        booking.status ===
        "Accepted"
    ) {

        actions = `

            <button
                class="btn btn-primary-custom btn-sm"
                onclick="changeStatus(
                    '${booking.id}',
                    'In Progress'
                )">

                <i class="bi bi-play-fill"></i>
                Start Work

            </button>

        `;

    }


    // In Progress
    if (
        booking.status ===
        "In Progress"
    ) {

        actions = `

            <button
                class="btn btn-success btn-sm"
                onclick="changeStatus(
                    '${booking.id}',
                    'Completed'
                )">

                <i class="bi bi-check-circle"></i>
                Mark Complete

            </button>

        `;

    }


    return `

        <article class="booking-item">

            <div>

                <span class="booking-id">
                    ${booking.bookingId}
                </span>

                <h4 class="booking-title">
                    ${booking.category}
                </h4>

                <div class="booking-meta">

                    <span>
                        <i class="bi bi-calendar"></i>
                        ${booking.date}
                    </span>

                    <span>
                        <i class="bi bi-clock"></i>
                        ${booking.time}
                    </span>

                    <span>
                        <i class="bi bi-geo-alt"></i>
                        ${booking.location}
                    </span>

                </div>

                <p class="text-muted mt-3 mb-0">

                    ${booking.description}

                </p>

            </div>


            <div class="text-md-end">

                <span
                    class="status-badge ${statusClass}">

                    ${booking.status}

                </span>

                <div class="d-flex gap-2 mt-3">

                    ${actions}

                </div>

            </div>

        </article>

    `;

}


// ==========================================
// STATUS CHANGE
// ==========================================

window.changeStatus =
    async function (
        bookingId,
        status
    ) {

        try {

            await updateBookingStatus(
                bookingId,
                status
            );


        } catch (error) {

            alert(
                error.message
            );

        }

    };


// ==========================================
// LOGOUT
// ==========================================

document
    .getElementById("logoutBtn")
    ?.addEventListener(
        "click",
        logoutUser
    );