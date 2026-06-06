const Booking = require('../models/bookingModel');
const Show = require('../models/showModel');

exports.makeBooking = async (req, res) => {
    try {
        const { showId, seats, transactionId, userId } = req.body; 
        // req.body.userId is automatically supplied by your authMiddleware

        // 1. Fetch the scheduled show
        const show = await Show.findById(showId);
        if (!show) {
            return res.status(404).send({ success: false, message: "Show not found." });
        }

        // 2. CONCURRENCY CHECK: Verify none of the selected seats are already taken
        const isAnySeatAlreadyBooked = seats.some(seat => show.bookedSeats.includes(seat));
        if (isAnySeatAlreadyBooked) {
            return res.status(400).send({ 
                success: false, 
                message: "One or more selected seats have already been taken. Please refresh." 
            });
        }

        // 3. Update the Show document to register the newly booked seats
        const updatedSeats = [...show.bookedSeats, ...seats];
        await Show.findByIdAndUpdate(showId, { bookedSeats: updatedSeats });

        // 4. Create the booking receipt with your default 'booked' status
        const newBooking = new Booking({
            show: showId,
            user: userId,
            seats: seats,
            transactionId: transactionId,
            status: 'booked' // Aligns with your enum!
        });

        await newBooking.save();

        res.status(201).send({
            success: true,
            message: "Tickets successfully booked! Enjoy your movie.",
            data: newBooking
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};


exports.cancelBooking = async (req, res) => {
    try {
        const { bookingId } = req.body; // The frontend passes the booking record ID

        // 1. Locate the booking record
        const booking = await Booking.findById(bookingId);
        if (!booking) {
            return res.status(404).send({ success: false, message: "Booking not found." });
        }

        // 2. Prevent double cancellations
        if (booking.status === 'cancelled') {
            return res.status(400).send({ success: false, message: "This booking is already cancelled." });
        }

        // 3. 🎯 WHERE WE UPDATE & OPEN THE SEATS:
        const show = await Show.findById(booking.show);
        if (show) {
            // Filter out the seats belonging to this booking from the show's master list
            const remainingSeats = show.bookedSeats.filter(
                (seat) => !booking.seats.includes(seat)
            );
            
            // Save the newly cleared array back to the Show document
            await Show.findByIdAndUpdate(booking.show, { bookedSeats: remainingSeats });
        }

        // 4. Update the receipt status to 'cancelled'
        booking.status = 'cancelled';
        await booking.save();

        res.status(200).send({
            success: true,
            message: "Booking successfully cancelled. Seats are now open for booking!"
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};