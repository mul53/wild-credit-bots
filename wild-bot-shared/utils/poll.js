const poll = ({ fn, interval }) => {
    setInterval(fn, interval)
}

exports.poll = poll
