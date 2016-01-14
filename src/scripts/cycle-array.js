let index = 0;

export default function cycle(arr, direction) {
	const length = arr.length;
	index = index + direction;

	if (index > length - 1) {
		index = 0;
	}

	if (index < 0) {
		index = length - 1;
	}

	return arr[index];
}
